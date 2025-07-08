import mongoose from "mongoose";
import { User } from "../model/user.model";
import { Article,IArticle } from "../model/article.model";
import { ArticleVersion } from "../model/articleVersion.model";
import { faker } from "@faker-js/faker";

export const adminCheckSeeder = async () => {
  try {
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      console.log("Admin user already exists, skipping seeding.");
      return;
    }
      const newAdmin = new User({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin"
      });
      await newAdmin.save();
    
  } catch (error) {
    console.error("Error checking admin user:", error);
  }
}