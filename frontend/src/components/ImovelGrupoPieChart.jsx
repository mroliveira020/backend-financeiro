import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import chartPalette from "../utils/chartPalette";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export default function ImovelGrupoPieChart({ grupos = [] }) {
  const { datasets, labels, legend } = useMemo(() => {
    const itens = Array.isArray(grupos)
      ? grupos
          .filter((grupo) => grupo && typeof grupo.total !== "undefined")
          .map((grupo) => ({
            nome: grupo.grupo ?? "Sem grupo",
            total: Number(grupo.total) || 0,
          }))
      : [];

    if (!itens.length) {
      return { datasets: null, labels: [], legend: [] };
    }

    const legend = itens.map((item, index) => {
      const cor = chartPalette[index % chartPalette.length];
      return {
        ...item,
        cor,
        valorAbsoluto: Math.abs(item.total),
      };
    });

    const datasets = [
      {
        data: legend.map((item) => item.valorAbsoluto),
        backgroundColor: legend.map((item) => item.cor),
        borderColor: legend.map((item) => item.cor.replace("0.65", "0.85")),
        borderWidth: 1,
        hoverOffset: 4,
      },
    ];

    return {
      datasets,
      labels: legend.map((item) => item.nome),
      legend,
    };
  }, [grupos]);

  if (!datasets) {
    return <p className="text-muted mini-pie-chart__empty">Sem lançamentos confirmados.</p>;
  }

  return (
    <div className="mini-pie-chart__wrapper">
      <div className="mini-pie-chart__canvas">
        <Doughnut
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = labels[context.dataIndex] || "";
                    const item = legend[context.dataIndex];
                    const valor = item ? item.total : context.parsed || 0;
                    return `${label}: ${currencyFormatter.format(valor)}`;
                  },
                },
              },
            },
          }}
        />
      </div>
      <ul className="mini-pie-chart__legend">
        {legend.map((item, index) => (
          <li key={`${item.nome}-${index}`} className="mini-pie-chart__legend-item">
            <span
              className="mini-pie-chart__color"
              style={{ backgroundColor: item.cor }}
            />
            <span className="mini-pie-chart__label">{item.nome}</span>
            <span className="mini-pie-chart__value">{currencyFormatter.format(item.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
