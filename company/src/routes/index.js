const auth = require("../auth/auth");
const { addCompany, getCompanyById, updateCompany } = require("../controllers/companyController");

const router = require("express").Router();

router.post("/add", auth, addCompany);
router.get("/:id", auth, getCompanyById);
router.put("/update/:id", auth, updateCompany);


module.exports = router;