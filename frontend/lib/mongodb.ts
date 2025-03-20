import mongoose, { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

const MONGODB_URI = "mongodb+srv://devultimate:Msdthiru7!@cluster0.nt80u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

console.log("MONGODB_URI");
console.log(MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

console.log("cached");
console.log(cached);

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached = global.mongoose = {
      conn: null,
      promise: mongoose.connect(MONGODB_URI, opts),
    };
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect; 