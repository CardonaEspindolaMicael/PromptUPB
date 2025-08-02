import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import http from 'http';
export class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001; // Usamos un solo puerto
    this.server = http.createServer(this.app); // Usamos el servidor HTTP compartido
    this.routerMain = "/api-v1"; 

  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(this.routerMain, router);
  }


  execute() {
    this.middlewares();
 //   this.configureSockets();

    // Iniciamos el servidor HTTP que manejará tanto la API como los WebSockets
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
