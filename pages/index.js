import { useCallback } from "react";
import { ExportToCsv } from "export-to-csv";
import resolveCSV, { titleColumns } from "../utils/resolveCSV";

import styles from "../styles.module.css";

const IGNORE_BATCH_FILES = [".DS_Store"];

const exportOptions = {
  filename: `${new Date().getMonth()}.${new Date().getDate()}-豆嗑`,
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: false,
  title: "豆嗑",
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
  // headers: titleColumns,
};

export default function Home() {
  const handleUploadChange = useCallback(
    async ({ target: { validity, files } }) => {
      if (!files) {
        setDryRunError("無法選擇檔案");
        return;
      }

      const sanitizedFiles = [...files].filter(
        (file) => !IGNORE_BATCH_FILES.includes(file.name)
      );

      console.info({ sanitizedFiles, validity });

      const CSVMetadataFile = sanitizedFiles.find((file) =>
        /.csv/.test(file.name.toLowerCase())
      );

      const onError = (msg) => {
        console.error(msg);
      };

      const parsedMetadata = await resolveCSV({
        csv: CSVMetadataFile,
        onError,
      });

      if (!parsedMetadata) {
        onError("解析檔案錯誤: metadata CSV");
        return;
      }

      console.log({ parsedMetadata });

      const csvExporter = new ExportToCsv(exportOptions);

      csvExporter.generateCsv(parsedMetadata);
    },
    []
  );

  return (
    <div className={styles.hello}>
      <p>Hello~ 來換一下資料型態</p>
      <div>
        <input accept="text/csv" type="file" onChange={handleUploadChange} />
      </div>
    </div>
  );
}
