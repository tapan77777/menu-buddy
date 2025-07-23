export default async function handler(req, res) {
  const { id } = req.query;
  await Restaurant.findByIdAndUpdate(id, { $inc: { visits: 1 } });
  res.json({ success: true });
}