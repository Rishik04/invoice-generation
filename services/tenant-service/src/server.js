import express from 'express';
import tenantRouter from "./routes/tenant.js";

const PORT = 8080;
const app = express();

app.use("/", tenantRouter)


app.listen(PORT, ()=>{
    console.log(`tenant server is running on http://localhost:${PORT}`)
})

