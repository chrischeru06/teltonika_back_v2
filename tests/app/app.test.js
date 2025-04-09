const request = require("supertest")
const app = require("../../app")
const dotenv = require("dotenv")
dotenv.config()

let server

beforeAll((done) => {
   server = app.listen(process.env.PORT || 8000, () => {
      console.log("Test server running")
      done()
   })
})

afterAll((done) => {
   server.close(() => {
      done()
   })
})

describe("Initialisation de l'application", () => {
   it("Démarrer l'application et rétouner 404 pour une route non trouvée", async () => {
      const res = await request(server).get("/unknown-route")
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("message", "Route non trouvée")
   })
})
