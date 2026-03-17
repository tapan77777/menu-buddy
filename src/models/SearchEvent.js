import mongoose from "mongoose";

const SearchEventSchema = new mongoose.Schema({
  keyword:      { type: String, required: true, unique: true },
  count:        { type: Number, default: 1 },
  lastSearched: { type: Date,   default: Date.now },
});

export default mongoose.models.SearchEvent ||
  mongoose.model("SearchEvent", SearchEventSchema);
