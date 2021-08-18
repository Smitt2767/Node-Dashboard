const Olympic = require("../models/Olympic");
// const data = require("../db.json").olympic;
const XLSX = require("xlsx");
const jsonToHTMLTable = require("../utils/jsonToHTMLTable");
const pdf = require("html-pdf");
const moment = require("moment");

const getWhereForTextType = (filter, filterKey) => {
  let where = "";
  if (filter.type === "contains") {
    where += `${filterKey} regexp '${filter.filter}' `;
  } else if (filter.type === "equals") {
    where += `${filterKey} regexp '^${filter.filter}$' `;
  } else if (filter.type === "notContains") {
    where += `not ${filterKey} regexp '${filter.filter}' `;
  } else if (filter.type === "notEqual") {
    where += `not ${filterKey} regexp '^${filter.filter}$' `;
  } else if (filter.type === "startsWith") {
    where += `${filterKey} regexp '^${filter.filter}' `;
  } else if (filter.type === "endsWith") {
    where += `${filterKey} regexp '${filter.filter}$' `;
  } else {
  }

  return where;
};

const getWhereForNumberType = (filter, filterKey) => {
  let where = "";
  if (filter.type === "equals") {
    where += `${filterKey} = ${filter.filter} `;
  } else if (filter.type === "notEqual") {
    where += `${filterKey} <> ${filter.filter} `;
  } else if (filter.type === "lessThan") {
    where += `${filterKey} < ${filter.filter} `;
  } else if (filter.type === "lessThanOrEqual") {
    where += `${filterKey} <= ${filter.filter} `;
  } else if (filter.type === "greaterThan") {
    where += `${filterKey} > ${filter.filter} `;
  } else if (filter.type === "greaterThanOrEqual") {
    where += `${filterKey} >= ${filter.filter} `;
  } else if (filter.type === "inRange") {
    where += `${filterKey} between ${filter.filter} and ${filter.filterTo} `;
  } else {
  }
  return where;
};

const getWhereForDateType = (filter, filterKey) => {
  let where = "";
  if (filter.type === "equals") {
    where += `${filterKey} = '${filter.dateFrom}' `;
  } else if (filter.type === "notEqual") {
    where += `${filterKey} <> '${filter.dateFrom}' `;
  } else if (filter.type === "lessThan") {
    where += `${filterKey} < '${filter.dateFrom}' `;
  } else if (filter.type === "greaterThan") {
    where += `${filterKey} > '${filter.dateFrom}' `;
  } else if (filter.type === "inRange") {
    where += `${filterKey} between '${filter.dateFrom}' and '${filter.dateTo}' `;
  } else {
  }
  return where;
};

const generateWhere = (filters) => {
  let where = "";
  Object.keys(filters).forEach((filter, i) => {
    if (filters[filter].filterType === "text") {
      if (!!!filters[filter].operator) {
        where += getWhereForTextType(filters[filter], filter);
      } else {
        where += `(${getWhereForTextType(filters[filter].condition1, filter)}${
          filters[filter].operator
        } ${getWhereForTextType(filters[filter].condition2, filter)}) `;
      }
    } else if (filters[filter].filterType === "number") {
      if (!!!filters[filter].operator) {
        where += getWhereForNumberType(
          filters[filter],
          `${filter !== "total" ? filter : "(gold + silver + bronze)"}`
        );
      } else {
        where += `(${getWhereForNumberType(
          filters[filter].condition1,
          `${filter !== "total" ? filter : "(gold + silver + bronze)"}`
        )}${filters[filter].operator} ${getWhereForNumberType(
          filters[filter].condition2,
          `${filter !== "total" ? filter : "(gold + silver + bronze)"}`
        )}) `;
      }
    } else if (filters[filter].filterType === "date") {
      if (!!!filters[filter].operator) {
        where += getWhereForDateType(filters[filter], filter);
      } else {
        where += `(${getWhereForDateType(filters[filter].condition1, filter)}${
          filters[filter].operator
        } ${getWhereForDateType(filters[filter].condition2, filter)}) `;
      }
    }
    if (
      Object.keys(filters).length > 0 &&
      i !== Object.keys(filters).length - 1 &&
      where
    )
      where += "and ";
  });

  return where;
};

exports.getData = async (req, res) => {
  try {
    const start = req.query.start * 1 || 0;
    const limit = req.query.limit * 1 || 20;
    const sort = req.query.sort
      ? req.query.sort !== "total"
        ? req.query.sort
        : "(gold + silver + bronze)"
      : "id";
    const order = req.query.order || "asc";

    const filters = JSON.parse(req.query.filter);

    const where = generateWhere(filters);

    const totalRecords = await Olympic.totalRecords(where);
    const data = await Olympic.find({ start, limit, sort, order, where });

    return res.json({
      sucess: true,
      totalRecords,
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.create = async (req, res) => {
  try {
    // const newData = data.map(
    //   ({ athlete, age, country, year, date, sport, gold, silver, bronze }) => {
    //     const newDate = date.split("/");
    //     date = new Date(`${newDate[2]}-${newDate[1]}-${newDate[0]}`);

    //     return [athlete, age, country, year, date, sport, gold, silver, bronze];
    //   }
    // );

    // const result = await Olympic.create(newData);
    // console.log(result);

    return res.json({
      sucess: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.generateXlsx = async (req, res, next) => {
  try {
    const sort = req.query.sort
      ? req.query.sort !== "total"
        ? req.query.sort
        : "(gold + silver + bronze)"
      : "id";
    const order = req.query.order || "asc";

    const filters = JSON.parse(req.query.filter);

    const where = generateWhere(filters);

    const data = await Olympic.find({ sort, order, where });

    var ws = XLSX.utils.json_to_sheet(
      data.map((rec) => {
        return {
          ...rec,
          date: moment(rec.date).format("DD/MM/YYYY"),
          total: rec.gold + rec.silver + rec.bronze,
        };
      })
    );

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Olympic");
    var buffer = XLSX.write(wb, {
      bookType: "xlsx",
      bookSST: false,
      type: "base64",
    });

    return res.send(new Buffer.from(buffer, "base64"));
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.generatePdfTable = async (req, res, next) => {
  try {
    const sort = req.query.sort
      ? req.query.sort !== "total"
        ? req.query.sort
        : "(gold + silver + bronze)"
      : "id";
    const order = req.query.order || "asc";

    const filters = JSON.parse(req.query.filter);

    const where = generateWhere(filters);

    const data = await Olympic.find({ sort, order, where });

    const html = jsonToHTMLTable({
      tableName: "Olympic",
      head: [
        "id",
        "athlete",
        "age",
        "country",
        "year",
        "date",
        "sport",
        "gold",
        "silver",
        "bronze",
        "total",
      ],
      body: data.map((rec) => {
        return {
          ...rec,
          date: moment(rec.date).format("DD/MM/YYYY"),
          total: rec.gold + rec.silver + rec.bronze,
        };
      }),
    });

    const config = {
      border: {
        top: "0.3in",
        right: "0.2in",
        left: "0.2in",
        bottom: "0.3in",
      },
      header: {
        height: "20mm",
      },
      footer: {
        height: "10mm",
        contents: {
          default: "<span>{{page}}</span>/<span>{{pages}}</span>",
        },
      },
    };

    pdf.create(html, config).toBuffer(function (err, buffer) {
      if (err) {
        return res.status(500).json({
          sucess: false,
          message: "something went wrong",
        });
      }
      return res.send(new Buffer.from(buffer, "base64"));
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
