import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes, AuthRoutes } from "./Routes/indexRoute";
import AuthMiddleware from "./Routes/Middleware/AuthMiddleware";
import ProtectedRoutes from "./Routes/Middleware/ProtectedMiddleware";
import { CommonLayout } from "./Routes/Layout/CommonLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { BecomePartner } from "./Components";

function App() {
    return (
        <>
            <BrowserRouter>
                <ToastContainer limit={10} newestOnTop={true} autoClose={2000} />
                <Routes>
                    {publicRoutes.map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                <ProtectedRoutes>
                                    <CommonLayout>{route.component}</CommonLayout>
                                </ProtectedRoutes>
                            }
                        />
                    ))}
                    {AuthRoutes.map((route, index) =>
                        route.nestedRoute ? (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <AuthMiddleware>
                                        <CommonLayout>{route.component}</CommonLayout>
                                    </AuthMiddleware>
                                }
                            >
                                {route?.childRoute?.map((cRoute, cIndex) =>
                                    cRoute.path ? (
                                        <Route
                                            key={cIndex}
                                            path={cRoute.path}
                                            element={cRoute.component}
                                        />
                                    ) : (
                                        <Route key={cIndex} index element={cRoute.component} />
                                    )
                                )}
                            </Route>
                        ) : (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <AuthMiddleware>
                                        <CommonLayout>{route.component}</CommonLayout>
                                    </AuthMiddleware>
                                }
                            />
                        )
                    )}
                    <Route
                        key={"bp"}
                        path={"/become-partner"}
                        element={
                            <CommonLayout>{<BecomePartner />}</CommonLayout>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </>
    );
}
export default App;
