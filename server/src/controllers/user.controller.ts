import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../model/user.model";
import { Article, IArticle } from "../model/article.model";
import { ArticleVersion } from "../model/articleVersion.model";
import { Types } from "mongoose";
import validator from "validator";
import { AuthenticatedRequest } from "../middleware/verifyAccessToken";
import { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../utils/customError";
import { io, connectedUsers } from "../../server";
import { Notification } from "../model/notify.model";
import { Message } from "../model/message.model";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try { console.warn("hello")
    const { name, email, password, role }: IUser = req.body;

    if (!name || !email || !password) {
      return next(new CustomError("Name, Email and Password are expected"));
    }

    if (!validator.isEmail(email)) {
      return next(new CustomError("Invalid email format"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new CustomError("Email already registered"));
    }
    //  console.log("still running ...")
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (error) {
    console.error("Error registering user:", error);
    return next(error);
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: IUser = req.body;
    // Check if user exists
    if (!email || !password) {
      res.status(400).json({ message: "EMAIL OR PASSWORD MISSING" });
      return;
    }
    // console.log(email,password,"email or password")
    if (!validator.isEmail(email)) {
      res.status(400).json({ message: "INVALID EMAIL" });
      return;
    }
    //  console.log("email.o")
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "USER NOT FOUND" });
      return;
    }
    console.log("user not found but still there");
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid Password" });
      return;
    }

    // Generate access token
    const accessToken = user.generateAccessToken();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        following: user.following,
        followers: user.followers,
      },
    });
    return;
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: error });
    return;
  }
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    if (!req.cookies.accessToken) {
      throw new Error("No user is logged in");
    }
    res
      .clearCookie("accessToken")
      .status(200)
      .json({ message: "User logged out successfully" });
    console.log("logout successfully");
    return;
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const profile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo = req.user as JwtPayload;
    const { name } = req.body;

    if (!name) {
      return next(new CustomError("Name is required"));
    }

    const user = await User.findByIdAndUpdate(
      userInfo.id,
      { name },
      { new: true }
    );

    const accessToken = user?.generateAccessToken();
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      id: userInfo.id,
      name: user?.name,
      email: user?.email,
      role: userInfo.role,
    });
  } catch (error) {
    next(error);
  }
};

const createArticle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
    if (!userInfo || !userInfo.id) {
      throw new Error("User not authenticated");
    }
    const userId: JwtPayload = userInfo.id; // Assumes req.user is set by auth middleware
    const { title, description } = req.body;

    if (!title || !description) {
      throw new Error("Title and description are required");
    }
    const checkArticle = await Article.findOne({
      $and: [
        { $or: [{ title: title.trim() }, { description: description.trim() }] },
        {
          user: userId,
        },
      ],
    });
    if (checkArticle) {
      res.status(400).json({ message: "Already exists" });

      return;
    }

    // Step 1: Create the article (without versions initially)
    const article: IArticle = new Article({
      title,
      description,
      user: userId,
    });

    await article.save();

    // Step 2: Create the first version
    const version = new ArticleVersion({
      article: article._id,
      description,
    });

    await version.save();

    article.versions.push(version._id as Types.ObjectId);
    await article.save();

    // Step 4: Link article to user
    await User.findByIdAndUpdate(userId, {
      $push: { articles: article._id },
    });

    res.status(201).json({
      message: "Article created successfully",
      articleId: article._id,
      role: userInfo.role,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const listArticles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload;
    console.log("userInfo", userInfo);
    // Assuming req.user is set by auth middleware
    if (!userInfo || !userInfo.id) {
      throw new Error("User not authenticated");
    }
    const userId: JwtPayload = userInfo.id; // Assumes req.user is set by auth middleware

    if (userInfo?.role == "admin") {
      // If the user is an admin, return all articles

      const articles = await Article.find({ user: userId })
        .select("-__v -versions ")
        .sort({ createdAt: -1 });
      //   console.log('articles', articles);
      res.status(200).json(articles);
      return;
    }
    const adminUser = await User.findOne({ role: "admin" });
    const articles = await Article.find(
      {
        $or: [{ user: userId }, { user: adminUser?._id }],
      },
      { __v: 0, versions: 0 } // projection: exclude fields
    ).sort({ createdAt: -1 }); // Sort by creation date, most recent first
    res.status(200).json(articles);

    return;
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json(error);
  }
};

const updateArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
    const userId = userInfo?.id;
    const articleId = req.params.id;
    const { title, description } = req.body;

    if (!userId) {
      return next(new CustomError("User not authenticated", 401));
    }

    if (!title && !description) {
      return next(
        new CustomError(
          "At least one of title or description must be provided",
          400
        )
      );
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return next(new CustomError("Article not found", 404));
    }

    if (article.user.toString() !== userId) {
      return next(
        new CustomError(
          "You do not have permission to update this article",
          403
        )
      );
    }

    // 💡 1. If description provided
    if (description) {
      const trimmedNewDescription = description.trim();
      const trimmedCurrentDescription = article.description.trim();

      // 🔁 Case 1: Same as current → no need to update
      if (trimmedNewDescription === trimmedCurrentDescription) {
        res.status(200).json({ message: "No changes made to the article" });
        return;
      }

      // 🔍 Case 2: Check if already exists in older versions
      const duplicateVersion = await ArticleVersion.findOne({
        article: article._id,
        description: trimmedNewDescription,
      });

      if (duplicateVersion) {
        return next(
          new CustomError(
            "This description already exists in an older version of the article",
            400
          )
        );
      }

      // ✅ Save current as new version
      const newVersion = new ArticleVersion({
        article: article._id,
        description: trimmedCurrentDescription,
        updatedAt: new Date(),
      });

      await newVersion.save();
      article.versions.push(newVersion._id as Types.ObjectId);

      // ✅ Update with new description
      article.description = trimmedNewDescription;
    }

    // 💡 Update title if provided
    if (title) {
      article.title = title.trim();
    }

    await article.save();

    res.status(200).json({
      message: "Article updated successfully",
      articleId: article._id,
      title: article.title,
      description: article.description,
    });
  } catch (error: any) {
    console.error("Error updating article:", error);
    return next(new CustomError(error.message || "Internal server error", 500));
  }
};

const listOlderVersions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo = req.user as JwtPayload;
    // Assuming req.user is set by auth middleware
    if (!userInfo || !userInfo.id) {
      throw new Error("User not authenticated");
    }
    const articleId = req.params.id;

    const article = await Article.findById(articleId);

    if (!article) {
      return next(new CustomError("Article not found", 404));
    }
    const versions = await ArticleVersion.find({ article: article._id }).sort({
      updatedAt: -1,
    });

    res.status(200).json(versions);
    return;
  } catch (error) {
    return next(new CustomError("Internal server error", 500));
  }
};

export const articleById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
    // if (!userInfo || !userInfo.id) {
    //     throw new Error('User not authenticated');
    // }
    const articleId = req.params.id;
    console.log(articleId, "from articleById");
    const article = await Article.findById(articleId);
    if (!article) {
      return next(new CustomError("Article not found", 404));
    }
    res.status(200).json(article);
    return;
  } catch (error) {
    return next(new CustomError("Internal server error", 500));
  }
};

// delete articles and versions
const deleteArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
    if (!userInfo || !userInfo.id) {
      throw new Error("User not authenticated");
    }
    const userId: string = userInfo.id; // Assumes req.user is set by auth middleware
    const articleId = req.params.id;
    console.log(articleId, "from deleteArticle");
    const article = await Article.findById(articleId);
    console.log("article", article);
    if (!article) {
      return next(new CustomError("Article not found", 404));
    }
    if (article.user?.toString() !== userId) {
      return next(
        new CustomError(
          "You do not have permission to delete this article",
          403
        )
      );
    }
    // Delete all versions associated with the article
    await ArticleVersion.deleteMany({ article: article._id });
    // Delete the article itself
    await Article.findByIdAndDelete(articleId);
    // Remove article reference from user
    await User.findByIdAndUpdate(userId, { $pull: { articles: articleId } });
  } catch (error) {
    return next(new CustomError("Internal server error", 500));
  }
};

const getAllArticles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Fetching all articles");

    // Step 1: Fetch articles with user populated (name & email)
    const articles = await Article.find().populate("user", "name email");

    // Step 2: Format each article
    const formatted = articles.map((a) => ({
      id: a.id.toString(),
      title: a.title,
      description: a.description,
      likes: a.likes?.map((id: any) => id.toString()) || [],
      user: a.user && "_id" in a.user ? a.user._id.toString() : "",
      name: a.user && "name" in a.user ? a.user.name : "Unknown",
      email: a.user && "email" in a.user ? a.user.email : "Unknown",
    }));

    // console.log(formatted);

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return next(new CustomError("Internal server error", 500));
  }
};

const users = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInfo = req.user as JwtPayload;
    // if(userInfo.role !== 'admin'){
    //     return next (new CustomError('Unauthorized access',403));
    // }

    const users = await User.find().select("-password -__v -role ");
    res.status(200).json(users);
  } catch (error) {
    return next(new CustomError("Internal server error", 500));
  }
};

const likesController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("like controller");

    const userInfo = req.user as JwtPayload;
    const userId = userInfo?.id;

    if (!userId || !userInfo) {
      res.status(400).json({ message: "user not authorized" });
      return;
    }

    const article = await Article.findOne({ _id: req?.params?.id });
    // console.log(article,"articleeeee");

    const alreadyLiked = article?.likes.includes(userId);

    if (alreadyLiked) {
      await Article.findByIdAndUpdate(req.params.id, {
        $pull: { likes: userId },
      });
    } else {
      await article?.likes.push(userId);
    }

    await article?.save();
    // console.log("article liked", article?.likes);

    // ✅ EMIT NOTIFICATION ONLY ON LIKE (not unlike), and not to self
    if (!alreadyLiked && article?.user?.toString() !== userId) {
      const recipientId = article?.user.toString();
      const socketId = connectedUsers.get(recipientId as string);
      console.log(socketId, recipientId, userId, connectedUsers);

      const notification = await Notification.create({
        recipient: recipientId,
        sender: userId,
        type: "like",
        articleId: article?._id,
        message: `${userInfo.name || "Someone"} liked your article ${
          article?.title
        }`,
      });

      // ✅ Send if online

      if (socketId) {
        io.to(socketId).emit("notification", notification);
        console.log(socketId, "notification sent by socket", notification);
      }
    }

    res.json({ liked: !alreadyLiked });
    return;
  } catch (error) {
    console.error("❌ Like Error:", error);
    res.status(400).json("something went wrong");
  }
};

const notificationController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userInfo = req.user as JwtPayload;
    const userId = userInfo?.id;
    if (!userId) {
      res.status(400).json({ message: "user is not valid" });
      return;
    }
    const notification = await Notification.find({ recipient: userId });

    if (!notification) {
      res.json({ message: "No Notifications" });
      return;
    }
    res.status(200).json(notification);
    return;
  } catch (error) {
    res.status(400).json({ message: "something went wrong" });
    return;
  }
};

const notificationRead = async (req: AuthenticatedRequest, res: Response):Promise<void> => {
  try {console.log("notification read")
    const userInfo = req.user as JwtPayload;
    const userId = userInfo?.id;
    if (!userId) {
      res.status(400).json({ message: "Invalid data" });
      return;
    }

    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    res.json(`made it true`);
    return;
  } catch (error) {
    res.status(400).json({ message: "something went wrong" });
    return;
  }
};
const addMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload;
    const userId = userInfo?.id;
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text) {
      res.status(400).json({ message: "Data is missing" });
      return;
    }

    const socketid = connectedUsers.get(receiver as string);

    // Save message
    const message = await Message.create({ sender, receiver, text });
    //notification generated
    const notification = await Notification.create({
      recipient: receiver,
      sender: userId,
      type: "message",
      // articleId: article?._id,
      message: `${userInfo.name || "Someone"} messaged you`,
    });

    // Emit via Socket.IO if receiver is online
    if (socketid) {
      io.to(socketid).emit("receive-message", message);
      //for notification
      io.to(socketid).emit("notification", notification);
      console.log("socket of receiver", socketid);
    }
    console.log(socketid, "emited");
    // Update messageData: remove and unshift in a single update
    // for sender messageData
    await User.findByIdAndUpdate(userId, {
      $pull: { messageData: receiver },
    });
    await User.findByIdAndUpdate(userId, {
      $push: { messageData: { $each: [receiver], $position: 0 } },
    });
    //for receiver messageData
    await User.findByIdAndUpdate(receiver, {
      $pull: { messageData: userId },
    });
    await User.findByIdAndUpdate(receiver, {
      $push: { messageData: { $each: [userId], $position: 0 } },
    });

    res.status(200).json({ message: "Sent successfully" });
    return;
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal error" });
    return;
  }
};

const messageById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userInfo = req.user as JwtPayload;
    const receiver = userInfo?.id;
    const sender = req?.params?.id;
    // console.log("from all messages ", receiver);
    const messages = await Message.find({
      $or: [
        { receiver: receiver, sender: sender },
        { receiver: sender, sender: receiver },
      ],
    });
    // console.log("messages are here", messages);
    res.status(200).json(messages);

    return;
  } catch (error) {
    res.status(400).json(`internal error`);
  }
};
const messageList = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userInfo = req?.user as JwtPayload;
    const user = await User.findById(userInfo?.id);
    const users: { _id: string; name: string; email: string }[] =
      await User.find().select("_id name email");
    const activeUsers: { _id: string; name: string; email: string }[] = [];

    // Add users from messageData[] first
    user?.messageData?.forEach((_id) => {
      const match = users.find((u) => u._id.toString() === _id.toString());
      if (match) activeUsers.push(match);
    });
    // console.log(activeUsers,"active")
    // Add remaining users
    users.forEach((u) => {
      const exists = activeUsers.some(
        (ac) => ac._id.toString() === u._id.toString()
      );
      if (!exists) activeUsers.push(u);
    });
    // console.log(activeUsers.length,"active all")

    res.status(200).json(activeUsers);
    return;
  } catch (error) {
    res.status(400).json({ message: "Internal error" });
    return;
  }
};

const followController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.warn("follow controller hited");
    const userInfo = req?.user as JwtPayload;
    const { authorId } = req?.params;
    console.log(userInfo.id, authorId);
    if (userInfo?.id == authorId) {
      return next(new CustomError("you cant follow yourself"));
    }
    const user = await User.findById(userInfo?.id);
    const isFollowing = user?.following.includes(new Types.ObjectId(authorId));
    // if already following pulling ids from array
    if (isFollowing) {
      await User.findByIdAndUpdate(userInfo?.id, {
        $pull: { following: authorId },
      });
      await User.findByIdAndUpdate(authorId, {
        $pull: { followers: userInfo?.id },
      });
      console.log("id s pulled ");
    } else {
      await User.findByIdAndUpdate(userInfo?.id, {
        $push: { following: authorId },
      });
      await User.findByIdAndUpdate(authorId, {
        $push: { followers: userInfo?.id },
      });
      console.log("pushed ids", userInfo.id, authorId);
    }

    res.status(200).json({ following: !isFollowing });
    return;
  } catch (error) {
    next(error);
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  profile,
  createArticle,
  listArticles,
  updateArticle,
  deleteArticle,
  notificationRead,
  notificationController,
  listOlderVersions,
  likesController,
  getAllArticles,
  users,
  addMessage,
  messageById,
  messageList,
  followController,
};
