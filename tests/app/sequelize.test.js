const dotenv = require("dotenv")
dotenv.config()
const sequelize = require("../../utils/sequerize")

describe("Sequelize", () => {
   beforeAll(async () => {
      await sequelize.authenticate()
   })

   afterAll(async () => {
      await sequelize.close()
   })

   it("Sequelize peut se connecter sur la base de donnees correctement", async () => {
      expect(sequelize).toBeDefined()
      await expect(sequelize.authenticate()).resolves.not.toThrow()
   })

   it("Sequelize va utiliser une base de donnees correcte", async () => {
      // Verify that the database name matches the one in your environment variables
      const [result] = await sequelize.query("SELECT DATABASE() as db;")
      expect(result[0].db).toBe(process.env.DB_NAME)
   })
})
