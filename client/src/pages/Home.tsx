// import Sidebar from "../components/Sidebar";

import CreateArticle from "./CreateArticle";
import ListArticles from "./ListArticles";

export default function Home() {
  //  const [query, setQuery] = useState("");

  return (
    <>
      {/* <Sidebar /> */}
      <CreateArticle />
      <ListArticles />
    </>
  );
}
