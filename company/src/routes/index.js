const auth = require("../auth/auth");
const { addCompany, getCompanyById, updateCompany, getCompanyByEmail } = require("../controllers/companyController");

const router = require("express").Router();

router.get("/", auth, getCompanyByEmail)
router.post("/add", auth, addCompany);
router.put("/update/:id", auth, updateCompany);
router.get("/:id", auth, getCompanyById);


module.exports = router;