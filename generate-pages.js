const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, "pages.html");

// Những folder không cần scan
const IGNORE_DIRS = new Set([
  ".git",
  ".github",
  ".vercel",
  "node_modules",
]);

function scanDirectory(directory, relativePath = "") {
  const results = [];

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);
    const currentRelativePath = path.join(relativePath, entry.name);

    // Nếu folder có index.html thì đây là một page
    const indexPath = path.join(fullPath, "index.html");

    if (fs.existsSync(indexPath)) {
      results.push({
        name: entry.name,
        path: "/" + currentRelativePath.replace(/\\/g, "/") + "/index.html",
      });
    }

    // Scan tiếp folder con
    results.push(
      ...scanDirectory(fullPath, currentRelativePath)
    );
  }

  return results;
}

function formatName(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const pages = scanDirectory(ROOT)
  .sort((a, b) => a.name.localeCompare(b.name));

const rows = pages
  .map(
    (page, index) => `
      <tr>
        <td>${index + 1}</td>
        <td class="page-name">${formatName(page.name)}</td>
        <td>
          <code>${page.path}</code>
        </td>
        <td>
          <a
            href="${encodeURI(page.path)}"
            target="_blank"
            rel="noopener noreferrer"
            class="open-btn"
          >
            Open
          </a>
        </td>
      </tr>
    `
  )
  .join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Pages</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      background: #f7f7f8;
      color: #18181b;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 28px;
    }

    .count {
      margin-bottom: 24px;
      color: #71717a;
      font-size: 14px;
    }

    .table-wrapper {
      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e4e4e7;
    }

    th {
      background: #fafafa;
      font-size: 13px;
      color: #52525b;
      font-weight: 600;
    }

    tr:last-child td {
      border-bottom: none;
    }

    td:first-child {
      width: 60px;
      color: #71717a;
    }

    .page-name {
      font-weight: 500;
    }

    code {
      font-size: 13px;
      color: #52525b;
    }

    .open-btn {
      display: inline-block;
      padding: 7px 12px;
      border-radius: 6px;
      background: #18181b;
      color: white;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
    }

    .open-btn:hover {
      opacity: 0.8;
    }

    @media (max-width: 700px) {
      body {
        padding: 20px;
      }

      th:nth-child(3),
      td:nth-child(3) {
        display: none;
      }
    }
  </style>
</head>

<body>

  <div class="container">

    <h1>Pages</h1>

    <div class="count">
      ${pages.length} page${pages.length === 1 ? "" : "s"} found
    </div>

    <div class="table-wrapper">
      <table>

        <thead>
          <tr>
            <th>#</th>
            <th>Page</th>
            <th>Path</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          ${
            rows ||
            `
              <tr>
                <td colspan="4">
                  No pages found.
                </td>
              </tr>
            `
          }
        </tbody>

      </table>
    </div>

  </div>

</body>
</html>
`;

fs.writeFileSync(OUTPUT, html, "utf8");

console.log(`Generated pages.html`);
console.log(`Found ${pages.length} pages`);

for (const page of pages) {
  console.log(`- ${page.path}`);
}