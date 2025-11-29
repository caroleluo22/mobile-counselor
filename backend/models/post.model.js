const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    likes: { type: Number, default: 0 },
    aiReply: { type: String },
    replies: [ReplySchema],
}, { timestamps: true });

/**
 * When a Post document is converted to JSON, also include the virtual `id` field.
 * Mongoose uses `_id` by default, but frontend components often work better with `id`.
 */
PostSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;