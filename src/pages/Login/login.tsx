import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import Logo from "../../assets/logif.gif";

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(username, password);
      onLogin(data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form bg-white p-4 rounded shadow-sm w-100 d-flex flex-column align-items-center"
        style={{ maxWidth: "400px" }}
        onSubmit={handleLogin}
      >
        <img src={Logo} alt="User Avatar" width="150" height="150" className="rounded-circle" />
        <br />
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        {error && <div className="alert alert-danger w-100">{error}</div>}
        <div className="mb-3 w-100">
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 w-100">
          <input
            type="password"
            placeholder="Contraseña"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary w-100"
          style={{ backgroundColor: "maroon", borderColor: "maroon" }}
        >
          Ingresar
        </button>
      </form>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="15" fill="rgba(128,0,0,0.1)"/><rect x="40" y="40" width="20" height="20" fill="rgba(0,128,128,0.1)"/><polygon points="70,10 90,40 50,40" fill="rgba(0,0,128,0.1)"/></svg>') repeat;
          animation: moveShapes 25s linear infinite;
        }

        .login-container::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="10" fill="rgba(128,0,0,0.15)"/><rect x="60" y="10" width="15" height="15" fill="rgba(0,128,128,0.15)"/></svg>') repeat;
          animation: moveShapesReverse 20s linear infinite;
        }

        .login-form {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(4px);
        }

        @keyframes moveShapes {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(-100px, -100px) rotate(360deg);
          }
        }

        @keyframes moveShapesReverse {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(100px, 100px) rotate(-360deg);
          }
        }

        .form-control {
          border-radius: 8px;
          border: 1px solid #ced4da;
          padding: 10px;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: maroon;
          box-shadow: 0 0 5px rgba(128, 0, 0, 0.3);
        }

        .btn-primary:hover {
          background-color: #5c0000;
          border-color: #5c0000;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Login;