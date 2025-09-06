import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import categoryRoutes from './routes/categoryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import complaintRoutes from './routes/complaintRoutes';
import userRoutes from './routes/userRoutes';
dotenv.config();

const app = express();
app.use(express.json()); 
app.use(cors()); 


app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use('/api', categoryRoutes);
app.use('/api', uploadRoutes); 
app.use('/api', complaintRoutes);
app.use('/api', userRoutes);


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});