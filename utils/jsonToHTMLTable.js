module.exports = ({ tableName, head, body }) => {
  let thead = "";
  head.forEach((header) => {
    thead += `<th>${header}</th>`;
  });

  let tbody = "";
  body.forEach((data) => {
    tbody += "<tr>";
    head.forEach((header) => {
      tbody += `<td>${data[header]}</td>`;
    });
    tbody += "</tr>";
  });

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Olympic</title>
    
        <style>
            * {
                padding: 0;
                margin: 0;
                box-sizing: border-box;
            }
            body{
                width: 100vw;
            }
            .container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            table {
              border-collapse: collapse;
              border-radius: 1em;
              overflow: hidden;
            }
            th, td {
              padding: 1em;
              border-bottom: 2px solid white; 
              border-right: 2px solid white;
              color: #333;
              text-align: center;
            }
            th {
              background: rgb(221,221,221);
              font-weight: 700;
              text-transform: capitalize;
            }
            td {
              background: rgba(221, 221, 221, 0.3);
              font-weight: 400;
            }
            tr:last-child td {
              border-bottom: none;
            }
            td:last-child, th:last-child {
              border-right: none;
            }
            .heading {
              text-align:center;
              widht: '100%';
              font-size: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
        <span class="heading" id="pageHeader">${tableName}</span>
        <table>
            <thead>
                <tr>
                   ${thead}
                </tr>
            </thead>
            <tbody>
               ${tbody}      
            </tbody>
        </table></div>
    </body>
    </html>`;
};
