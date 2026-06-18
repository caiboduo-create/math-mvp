(function () {
  const catalog = document.getElementById("modelCatalog");
  const count = document.getElementById("catalogCount");
  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const models = window.MathCoursewareModels.models;
  let activeFilter = "全部";

  function matchesFilter(model) {
    return activeFilter === "全部" || model.grade === activeFilter || model.domain === activeFilter;
  }

  function renderCatalog() {
    const visibleModels = models.filter(matchesFilter);
    catalog.replaceChildren();
    count.textContent = `${visibleModels.length} / ${models.length} 个模型`;

    visibleModels.forEach((model) => {
      const card = document.createElement("a");
      card.className = "model-card";
      card.href = `model.html?id=${encodeURIComponent(model.id)}`;
      card.innerHTML = `
        <span class="model-symbol" aria-hidden="true">${model.icon}</span>
        <span class="model-name">${model.title}</span>
        <span class="model-meta">${model.grade} · ${model.domain}</span>
        <span class="model-summary">${model.description}</span>
        <span class="tag-row">${model.tags.map((tag) => `<span>${tag}</span>`).join("")}</span>
      `;
      catalog.appendChild(card);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      renderCatalog();
    });
  });

  renderCatalog();
})();
