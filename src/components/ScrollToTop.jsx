import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log("Route changed to:", pathname);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // Change "smooth" to "instant" for debugging
  }, [pathname]);

  return null;
};

export default ScrollToTop;
