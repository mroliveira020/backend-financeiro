import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import palette from "../utils/chartPalette";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
});

function normalizarMesLabel(mesISO) {
  try {
    const data = new Date(mesISO);
    if (!Number.isNaN(data.getTime())) {
      return formatter.format(data).replace(" de ", "/");
    }
  } catch {
    /* ignore */
  }
  return mesISO;
}

export default function GastosMensaisChart({ dados = [] }) {
  const chartConfig = useMemo(() => {
    if (!dados.length) {
      return null;
    }

    const mesesOrdenados = Array.from(
      new Set(dados.map((item) => item.mes))
    ).sort();

    const gruposPorImovel = new Map();

    dados.forEach((item) => {
      if (!gruposPorImovel.has(item.id_imovel)) {
        gruposPorImovel.set(item.id_imovel, {
          label: item.nome_imovel,
          data: new Array(mesesOrdenados.length).fill(0),
        });
      }
      const dataset = gruposPorImovel.get(item.id_imovel);
      const mesIndex = mesesOrdenados.indexOf(item.mes);
      if (mesIndex >= 0) {
        dataset.data[mesIndex] = Number(item.total || 0);
      }
    });

    const datasets = Array.from(gruposPorImovel.values()).map((dataset, index) => ({
      ...dataset,
      backgroundColor: palette[index % palette.length],
      borderColor: palette[index % palette.length].replace("0.65", "0.9"),
      stack: "desembolsos",
      borderRadius: 4,
      borderWidth: 1,
    }));

    return {
      data: {
        labels: mesesOrdenados.map((mes) => normalizarMesLabel(mes)),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const valor = context.parsed.y || 0;
                return `${context.dataset.label}: ${valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 2,
                })}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            ticks: {
              callback: (value) =>
                Number(value).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }),
            },
          },
        },
      },
    };
  }, [dados]);

  if (!dados.length) {
    return (
      <div className="text-center text-muted py-4">
        <p className="mb-1">Ainda não há dados suficientes para montar o gráfico.</p>
        <small>Cadastre lançamentos confirmados para visualizar os totais mensais.</small>
      </div>
    );
  }

  if (!chartConfig) {
    return null;
  }

  return (
    <div style={{ minHeight: 320 }}>
      <Bar data={chartConfig.data} options={chartConfig.options} />
    </div>
  );
}
