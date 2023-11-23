import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const refreshTokenSchema = new mongoose.Schema({
    payloadDgst: String,
    shortId: String
});

refreshTokenSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.payloadDgst = await bcrypt.hash(this.payloadDgst, 10);
    }
    next();
});

export default mongoose.model('RefreshToken', refreshTokenSchema);