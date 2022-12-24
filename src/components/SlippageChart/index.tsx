import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { useCallback, useEffect, useMemo } from 'react';
import { uniqueId } from 'lodash';

echarts.use([SVGRenderer, LineChart, GridComponent, TooltipComponent, GraphicComponent]);

export default function SlippageChart({ chartData, fromTokenSymbol, toTokenSymbol }) {
	const id = useMemo(() => uniqueId(), []);

	const series = useMemo(() => {
		return {
			name: '',
			type: 'line',
			stack: 'value',
			symbol: 'none',
			itemStyle: {
				color: '#14b8a6'
			},
			emphasis: {
				focus: 'series',
				shadowBlur: 10
			},
			animation: false,
			data: chartData
		};
	}, [chartData]);

	const createInstance = useCallback(() => {
		const instance = echarts.getInstanceByDom(document.getElementById(id));

		return instance || echarts.init(document.getElementById(id));
	}, [id]);

	useEffect(() => {
		// create instance
		const chartInstance = createInstance();

		chartInstance.setOption({
			grid: {
				left: 0,
				containLabel: true,
				bottom: 0,
				top: 40,
				right: 64
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params: any) {
					const trade =
						'<li style="list-style:none">' +
						'Trade: $' +
						Number(params[0].value[0]).toLocaleString() +
						` of ${fromTokenSymbol}` +
						'</li>';

					const receive =
						'<li style="list-style:none">' +
						'Receive: ' +
						Number(params[0].value[2]).toLocaleString() +
						` ${toTokenSymbol}` +
						'</li>';

					const slippage = '<li style="list-style:none">' + 'Slippage: ' + params[0].value[1] + '%';
					('</li>');

					return trade + receive + slippage;
				}
			},
			xAxis: {
				type: 'category',
				name: 'Tokens',
				axisLine: {
					lineStyle: {
						color: 'rgba(255, 255, 255, 1)',
						opacity: 0.2
					}
				},
				axisLabel: {
					formatter: (value) => '$' + Number(value).toLocaleString()
				},
				boundaryGap: false,
				nameTextStyle: {
					fontFamily: 'inter, sans-serif',
					fontSize: 14,
					fontWeight: 400
				},
				splitLine: {
					lineStyle: {
						color: '#a1a1aa',
						opacity: 0.1
					}
				}
			},
			yAxis: {
				type: 'value',
				name: 'Slippage',
				axisLine: {
					lineStyle: {
						color: 'rgba(255, 255, 255, 1)',
						opacity: 0.1
					}
				},
				axisLabel: {
					formatter: (value) => value + '%'
				},
				boundaryGap: false,
				nameTextStyle: {
					fontFamily: 'inter, sans-serif',
					fontSize: 14,
					fontWeight: 400,
					color: 'rgba(255, 255, 255, 1)'
				},
				splitLine: {
					lineStyle: {
						color: '#a1a1aa',
						opacity: 0.1
					}
				},
				min: 0,
				max: 100
			},
			series
		});

		function resize() {
			chartInstance.resize();
		}

		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			chartInstance.dispose();
		};
	}, [createInstance, series, fromTokenSymbol, toTokenSymbol]);

	return <div id={id} style={{ height: '400px', margin: 'auto 0' }}></div>;
}
