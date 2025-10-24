import Bisection from "../pages/rootequation/bisection";
import FalsePo from "../pages/rootequation/falseposition";
import Newton from "../pages/rootequation/newton";
import Secant from "../pages/rootequation/secant";
import Graphical from "../pages/rootequation/graphical";
import One from "../pages/rootequation/onepoint";
import Home from "../pages/Home";
//integration
import CompoTrap from "../pages/integration/compositeTrap"

//linear algebra
import Cramer from "../pages/linear_algebra/cramer"

//interpolation
import Lagrange from "../pages/interpolation/lagrange";

//regression
import Multiple from "../pages/regression/multiple"
import Regression from "../pages/regression/linearPoly"
import { createBrowserRouter,RouterProvider} from "react-router";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/falseposition",
        element: <FalsePo/>
    },
    {
        path: "/bisection",
        element: <Bisection/>
    },
    {
        path: "/newton",
        element: <Newton/>
    },
    {
        path: "/secant",
        element: <Secant/>
    },
    {
        path: "/onepoint",
        element: <One/>
    },
    {
        path: "/graphical",
        element: <Graphical/>
    },
    //integration
    { 
        path: '/compotrap',
        element: <CompoTrap/>,
    },
    //algebra
    {
        path: '/Cramer',
        element:<Cramer/>
    },
    //interpolation
    {
        path: '/Lagrange',
        element: <Lagrange/>
    },
    //regression
    {
        path: '/MultiRe',
        element: <Multiple/>
    },
    {
        path: "/LinearP",
        element: <Regression/>
    }
]);

function AppRoute() {
    return <RouterProvider router={router}/>;
}
export default AppRoute;