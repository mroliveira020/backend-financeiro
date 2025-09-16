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
  const { datasets, labels, totais } = useMemo(() => {
    const itens = Array.isArray(grupos)
      ? grupos
          .filter((grupo) => grupo && typeof grupo.total !== "undefined")
          .map((grupo) => ({
            nome: grupo.grupo ?? "Sem grupo",
            total: Number(grupo.total) || 0,
          }))
      : [];

    if (!itens.length) {
      return { datasets: null, labels: [], totais: [] };
    }

    const datasets = [
      {
        data: itens.map((item) => Math.abs(item.total)),
        backgroundColor: itens.map((_, index) => chartPalette[index % chartPalette.length]),
        borderColor: itens.map((_, index) => chartPalette[index % chartPalette.length].replace("0.65", "0.85")),
        borderWidth: 1,
        hoverOffset: 4,
      },
    ];

    return {
      datasets,
      labels: itens.map((item) => item.nome),
      totais: itens.map((item) => item.total),
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
                    const valor = totais[context.dataIndex] ?? context.parsed ?? 0;
                    return `${label}: ${currencyFormatter.format(valor)}`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
