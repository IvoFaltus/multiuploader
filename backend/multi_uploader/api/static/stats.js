const summaryGrid = document.getElementById("summaryGrid");
const trendChart = document.getElementById("trendChart");
const platformList = document.getElementById("platformList");
const bucketList = document.getElementById("bucketList");
const recentList = document.getElementById("recentList");
const heroBadge = document.getElementById("heroBadge");

function formatMoney(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
  }).format(number);
}

function renderSummary(summary) {
  const cards = [
    {
      label: "Total listings",
      value: summary.total_listings,
      hint: "All listings owned by your account",
    },
    {
      label: "With images",
      value: summary.listings_with_images,
      hint: "Listings that already have at least one photo",
    },
    {
      label: "Platform links",
      value: summary.platform_links,
      hint: "Published platform relations across all listings",
    },
    {
      label: "Average price",
      value: formatMoney(summary.avg_price),
      hint: "Average from listings that have a price set",
    },
    {
      label: "Top platform",
      value: summary.top_platform,
      hint: "Most-used platform right now",
    },
  ];

  summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="summaryCard">
          <p class="summaryLabel">${card.label}</p>
          <p class="summaryValue">${card.value}</p>
          <p class="summaryHint">${card.hint}</p>
        </article>
      `,
    )
    .join("");

  heroBadge.textContent = `${summary.total_listings} listings tracked`;
}

function renderTrend(items) {
  const max = Math.max(...items.map((item) => item.count), 1);

  trendChart.innerHTML = items
    .map((item) => {
      const height = Math.max((item.count / max) * 100, item.count ? 12 : 4);
      return `
        <div class="trendBarWrap">
          <div class="trendBar" style="height:${height}%"></div>
          <div class="trendMeta">
            <span class="trendCount">${item.count}</span>
            <span class="trendLabel">${item.label}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderMeterRows(target, items, labelKey) {
  const max = Math.max(...items.map((item) => item.count), 1);

  target.innerHTML = items
    .map((item) => {
      const width = (item.count / max) * 100;
      return `
        <div class="${target.id === "platformList" ? "platformRow" : "bucketRow"}">
          <div class="${target.id === "platformList" ? "platformTop" : "bucketTop"}">
            <span class="${target.id === "platformList" ? "platformName" : "bucketName"}">${item[labelKey]}</span>
            <span class="${target.id === "platformList" ? "platformCount" : "bucketCount"}">${item.count}</span>
          </div>
          <div class="meter">
            <div class="meterFill" style="width:${width}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRecent(items) {
  if (!items.length) {
    recentList.innerHTML = '<div class="emptyState">No listings yet.</div>';
    return;
  }

  recentList.innerHTML = items
    .map(
      (item) => `
        <div class="recentRow">
          <div class="recentThumb" style="background-image:url('${item.image || ""}')"></div>
          <div>
            <div class="recentTop">
              <span class="recentTitle">${item.title}</span>
              <span class="recentMeta">${item.created_at}</span>
            </div>
            <div class="recentSubline">${item.platforms.join(", ") || "No platforms"} | ${item.price}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

async function loadStats() {
  try {
    const response = await fetch("/statistics/data/");
    if (!response.ok) {
      throw new Error("Stats request failed");
    }

    const data = await response.json();
    renderSummary(data.summary);
    renderTrend(data.timeline);
    renderMeterRows(
      platformList,
      data.platforms.map((item) => ({
        ...item,
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      })),
      "name",
    );
    renderMeterRows(bucketList, data.price_buckets, "label");
    renderRecent(data.recent_listings);
  } catch (error) {
    const message = '<div class="emptyState">Statistics could not be loaded.</div>';
    summaryGrid.innerHTML = message;
    trendChart.innerHTML = message;
    platformList.innerHTML = message;
    bucketList.innerHTML = message;
    recentList.innerHTML = message;
    heroBadge.textContent = "Load failed";
    console.error(error);
  }
}

loadStats();
