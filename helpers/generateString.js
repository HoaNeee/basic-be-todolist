module.exports.string = (length) => {
  const patten =
    "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * patten.length);
    out += patten[idx];
  }
  return out;
};

module.exports.number = (length) => {
  const patten = "0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * patten.length);
    out += patten[idx];
  }
  return out;
};
