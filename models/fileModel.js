import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now },
    data: { type: Buffer, required: true },
    iv: { type: String, required: true }, // Store the IV
    authTag: { type: String, required: true }, // Store the authentication tag
    userShortId: { type: String, required: true }  // Reference to the user's shortId
  });
  

const File = mongoose.model('File', fileSchema);

export default File;
