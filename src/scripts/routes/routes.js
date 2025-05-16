import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import LogoutHandler from "../pages/auth/logout-handler";
import NotFoundPage from "../pages/not-found/not-found-page"; // ✅ Tambahan

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add-story": new AddStoryPage(),
  "/logout": new LogoutHandler(),
  "*": new NotFoundPage(), // ✅ Tambahan wildcard route
};

export default routes;
