import mongoose from 'mongoose';

const singleUseTokenSchema = new mongoose.Schema({
    token: String,
    expiresAt: { type: Date, default: () => Date.now() + 3600000 },
    shortId: String
});
  
const generateShortId = function (length) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
}
singleUseTokenSchema.pre('save', async function(next) {
    if (this.isNew) {
    let tokenIdExists = false;
      do {
        const generatedTokenId = generateShortId(10);
        const tokenId = await this.constructor.findOne({ token: generatedTokenId });
        if (!tokenId) {
          this.token = generatedTokenId;
          tokenIdExists = false;
        } else {
            tokenIdExists = true;
        }
      } while (tokenIdExists);
    }
    next();
  });
const SingleUseToken = mongoose.model('SingleUseToken', singleUseTokenSchema);
  
export default SingleUseToken;