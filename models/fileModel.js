import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  data: { type: Buffer, required: true },
  iv: { type: String, required: true }, // Store the IV for file encryption
  authTag: { type: String, required: true }, // Store the authentication tag for file encryption
  userShortId: { type: String, required: true },  // Reference to the uploader's shortId
  accessList: [{ type: String }], // List of user shortIds who have access to the file
  sharedKey: { type: String }, // Encrypted shared key
  sharedKeyIv: { type: String }, // IV for the shared key encryption
  sharedKeyAuthTag: { type: String } // Authentication tag for the shared key encryption
});
  
const File = mongoose.model('File', fileSchema);

export default File;
