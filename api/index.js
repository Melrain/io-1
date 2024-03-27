import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import 'dotenv/config';
const { Schema, Document, model } = mongoose;

const httpServer = createServer();

let isConnected = false;

export const connectToDatabase = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) {
    return console.log('MISSING MONGODB_URL');
  }

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: 'takechance',
    });

    isConnected = true;

    console.log('MongoDB is connected');
  } catch (error) {
    console.log('MongoDB connection failed', error);
  }
};

await connectToDatabase();

const ResultSchema = new Schema({
  game: { type: String, required: true },
  player: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: Date, default: Date.now },
  deposite: {
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  multiplier: { type: Number, required: true },
  payout_amount: {
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
  },
});

const Result = mongoose.models.Result || model('Result', ResultSchema);

Result.watch().on('change', async () => {
  console.log('Result collection changed');
  io.emit('resultUpdate', 'Result collection changed');
  console.log('io emited');
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

httpServer.listen(8080).on('error', (error) => {
  console.log('Server error', error);
});

console.log('Server running on port 8080');
