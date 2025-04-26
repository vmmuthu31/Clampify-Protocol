import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  chainId: {
    type: String,
    required: true,
  },
  chainName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  initialSupply: String,
  maxSupply: String,
  initialPrice: String,
  creatorLockupPeriod: String,
  lockLiquidity: Boolean,
  liquidityLockPeriod: String,
  image: {
    type: String,
    default: "", // Empty string as default if no image provided
  },
});

// Create a compound index for uniqueness on both address and chainId
TokenSchema.index({ address: 1, chainId: 1 }, { unique: true });

export default mongoose.models.Token || mongoose.model("Token", TokenSchema);
