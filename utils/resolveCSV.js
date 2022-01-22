import Papa from "papaparse";

const config = {
  // delimiter: '' as string, // auto-detect
  // newline: '' as string, // auto-detect
  // quoteChar: '"',
  // escapeChar: '"',
  // header: false,
  // transformHeader: undefined,
  // dynamicTyping: false,
  // preview: 0,
  // encoding: '',
  // worker: false,
  // comments: false,
  // step: undefined,
  complete: function (results, file) {
    console.info("CSV parsing complete:", results, file);
  },
  error: function (error, file) {
    console.info("CSV parsing error:", error, file);
    throw new Error(error);
  },
  // download: false,
  // downloadRequestHeaders: undefined,
  // downloadRequestBody: undefined,
  skipEmptyLines: true,
  // chunk: undefined,
  // chunkSize: undefined,
  // fastMode: undefined,
  // beforeFirstChunk: undefined,
  // withCredentials: undefined,
  // transform: undefined,
  // delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP],
};

export const titleColumns = [
  "訂單編號",
  "送餐日期",
  "送餐時段",
  "商品分類",
  "商品名稱",
  "數量",
  "狀態",
  "金額",
  "送貨地址",
  "訂購人姓名",
  "訂購人電話",
  "取餐者姓名",
  "取餐者電話",
  "取餐者樓層",
];

const registeredColumnNameMap = new Map([
  ["訂單ID", "訂單編號"],
  ["取件時間", "送餐日期"],
  ["品項", "商品名稱"],
  ["外送地址", "送貨地址"],
  ["訂購人", "訂購人姓名"],
]);

export default function resolveCSV({ csv, startRowIdx = 0, onError }) {
  const handleError = (errMsg) => {
    console.error(errMsg);

    if (onError) {
      onError(errMsg);
    }
  };
  return new Promise((resolve, reject) => {
    try {
      Papa.parse(csv, {
        ...config,
        complete: ({ data, errors }, _) => {
          console.info(["CSV parsing complete:", data, errors]);

          if (errors && errors.length > 0) {
            throw new Error(errors[0]);
          }

          const columns = data[startRowIdx];
          // ? data[startRowIdx].map(
          //     (col = "") =>
          //       registeredColumnNameMap.get(col.toLowerCase()) || col
          //   )
          // : [];

          let result = [];

          for (let idx = startRowIdx + 1; idx < data.length; idx++) {
            const fetchedColumns = columns.reduce((ac, cu, cIdx) => {
              const mappedName = registeredColumnNameMap.get(cu);
              if (!cu) {
                return ac;
              }

              // console.log({mappedName})

              const value = data[idx][cIdx] || "";

              ac[mappedName || cu] = value;
              return ac;
            }, {});

            console.log({ columns, fetchedColumns });

            for (const fCol in fetchedColumns) {
              if (!titleColumns.includes(fCol)) {
                delete fetchedColumns[fCol];
              }
            }

            titleColumns.forEach((pCol) => {
              if (!fetchedColumns[pCol]) {
                fetchedColumns[pCol] = "";
              }
            });

            result.push(fetchedColumns);
          }

          resolve(result);
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        handleError(`CSV 錯誤: ${error.message}`);
      }
      reject(null);
    }
  });
}
