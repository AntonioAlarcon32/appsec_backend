import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },  // MIME type of the file
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  data: { type: Buffer, required: true }  // Buffer to store the file data
});

const File = mongoose.model('File', fileSchema);

export default File;
