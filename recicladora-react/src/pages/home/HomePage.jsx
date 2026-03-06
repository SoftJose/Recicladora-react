import { useEffect } from "react";
import StatCard from "../../components/dashboard/StatCard.jsx";
import "./HomePage.css";

const HomePage = () => {
    useEffect(() => {
        const fetchStats = async () => {
            // stats pendiente de integrar (por ahora no se usa en UI)
            // setStats({ materiales: 128, clientes: 54, ventas: 230 });
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
                    src="/../src/assets/img/logo_principal.png"
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