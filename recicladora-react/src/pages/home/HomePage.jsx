import { useEffect } from "react";
import "./HomePage.css";
import logoPrincipal from "../../assets/img/logo_principal.png";

const HomePage = () => {
    useEffect(() => {
        const fetchStats = async () => {
        };
        fetchStats();
    }, []);

    return (
        <div className="hero-container">
            {/* Partículas decorativas */}
            <div className="background-particles">
                <div className="circle" style={{ top: "20%", left: "70%" }}></div>
                <div className="circle" style={{ top: "40%", left: "20%" }}></div>
                <div className="circle" style={{ top: "80%", left: "50%" }}></div>
            </div>

            {/* Contenido centrado */}
            <div className="hero-content text-center">
                <img
                    src={logoPrincipal}
                    alt="Logo principal"
                    className="hero-logo animate__animated animate__fadeInDown"
                />

                <p className="hero-text animate__animated animate__fadeInUp">
                    El reciclaje es Vida
                </p>
            </div>
        </div>
    );
};

export default HomePage;