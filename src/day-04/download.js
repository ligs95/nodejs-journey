const { EventEmitter } = require("node:events");
const { Transform } = require("node:stream");
const fs = require("node:fs");
const path = require("node:path");

const downloadFolder = "./downloads";

class DownloadManager extends EventEmitter {
  constructor() {
    super();
  }

  // 创建进度追踪 Transform 流
  _createProgressStream(totalSize) {
    let bytesTransferred = 0;

    return new Transform({
      transform(chunk, _encoding, callback) {
        bytesTransferred += chunk.length;
        const percent = Math.round((bytesTransferred / totalSize) * 100);
        this.emit("progress", percent);
        callback(null, chunk);
      },
    });
  }

  download(url) {
    try {
      const fileName = path.basename(url);
      const downloadPath = path.join(downloadFolder, fileName);

      // 获取源文件大小
      const totalSize = fs.statSync(url).size;

      const writeStream = fs.createWriteStream(downloadPath);
      const progressStream = this._createProgressStream(totalSize);

      // 监听 progress 事件
      progressStream.on("progress", (percent) => {
        this.emit("progress", { file: url, percent });
      });

      // 监听完成事件
      writeStream.on("finish", () => {
        this.emit("complete", { file: url, size: writeStream.bytesWritten });
      });

      // 监听错误事件
      writeStream.on("error", (error) => {
        this.emit("error", { file: url, error });
      });
      progressStream.on("error", (error) => {
        this.emit("error", { file: url, error });
      });

      // 管道: 读取 → 进度追踪 → 写入
      fs.createReadStream(url).pipe(progressStream).pipe(writeStream);
    } catch (error) {
      this.emit("error", { file: url, error });
    }
  }
}


const manager = new DownloadManager();

manager.on('progress', ({ file, percent }) => { 
    console.log(`${file} 下载进度: ${percent}%`)
});
manager.on('complete', ({ file, size }) => { 
    console.log(`${file} 下载完成，大小: ${size} bytes`)
});
manager.on('error', ({ file, error }) => {
    console.error(`${file} 下载失败: ${error.message}`)
});

manager.download("./files/file1.zip");
