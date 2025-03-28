const { addCompany, getCompanyById, updateCompany } = require("../controllers/companyController");

const router = require("express").Router();

router.post("/add", addCompany);
router.get("/:id", getCompanyById);
router.put("/update/:id", updateCompany);


module.exports = router;