let _io = null;
let _socket = null;
module.exports.connet = (io) => {
  _io = io;
  _io.on("connection", (socket) => {
    _socket = socket;
    // console.log("a user connect " + socket.id);
  });
};

module.exports.getIo = () => {
  if (!_io) {
    throw new Error("not connect");
  }
  return _io;
};

module.exports.getSocket = () => {
  if (!_socket) {
    throw new Error("not connect");
  }
  return _socket;
};
