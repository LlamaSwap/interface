import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { DataZoomComponent, GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components';
import { useCallback, useEffect, useMemo } from 'react';
import { uniqueId } from 'lodash';
import logo from '~/public/defillama-light-neutral.png';

echarts.use([SVGRenderer, LineChart, GridComponent, TooltipComponent, GraphicComponent, DataZoomComponent]);

export default function SlippageChart({
	chartData,
	fromTokenSymbol,
	toTokenSymbol,
	mcap,
	minimumSlippage,
	maximumSlippage
}) {
	const id = useMemo(() => uniqueId(), []);

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
				bottom: 60,
				top: 40,
				right: 64
			},
			graphic: {
				type: 'image',
				z: 0,
				style: {
					image: logo.src,
					height: 40,
					opacity: 0.3
				},
				left: '45%',
				top: '130px'
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params: any) {
					const tradeInfo = mcap
						? `${((Number(params[0].value[0]) / mcap) * 100).toFixed(2)} % of Mcap`
						: `$${Number(params[0].value[0]).toFixed(2)})`;

					const trade =
						'<li style="list-style:none">' +
						'Trade: ' +
						Number(params[0].value[4]).toFixed(2) +
						` ${fromTokenSymbol} (${tradeInfo})` +
						'</li>';

					const receive =
						'<li style="list-style:none">' +
						'Receive: ' +
						Number(params[0].value[2]).toFixed(2) +
						` ${toTokenSymbol} via ${params[0].value[3]}` +
						'</li>';

					const slippage = '<li style="list-style:none">' + 'Slippage: ' + params[0].value[1] + '%';
					('</li>');

					return trade + receive + slippage;
				}
			},
			xAxis: {
				type: 'log',
				name: 'Tokens',
				axisLine: {
					lineStyle: {
						color: 'rgba(255, 255, 255, 1)',
						opacity: 0.2
					}
				},
				axisLabel: {
					formatter: (value) =>
						mcap ? `${((value / mcap) * 100).toFixed(2)} % of Mcap` : '$' + Number(value).toFixed(2),
					hideOverlap: true
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
				min: minimumSlippage,
				max: maximumSlippage
			},
			dataZoom: [
				{
					type: 'inside',
					start: 0,
					end: 100
				},
				{
					start: 0,
					end: 100,
					textStyle: {
						color: 'rgba(255, 255, 255, 1)'
					},
					borderColor: 'rgba(255, 255, 255, 0.4)',
					handleStyle: {
						borderColor: 'rgba(255, 255, 255, 0.9)',
						color: 'rgba(0, 0, 0, 0.4)'
					},
					moveHandleStyle: {
						color: 'rgba(255, 255, 255, 0.4)'
					},
					selectedDataBackground: {
						lineStyle: {
							color: '#14b8a6'
						},
						areaStyle: {
							color: '#14b8a6'
						}
					},
					emphasis: {
						handleStyle: {
							borderColor: 'rgba(255, 255, 255, 1)',
							color: 'rgba(255, 255, 255, 0.9)'
						},
						moveHandleStyle: {
							borderColor: 'rgba(255, 255, 255, 1)',
							color: 'rgba(255, 255, 255, 0.2)'
						}
					},
					fillerColor: 'rgba(0, 0, 0, 0.1)',
					labelFormatter: (value) => '$' + Number(value).toFixed(2)
				}
			],
			series: {
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
				animation: false
			}
		});

		function resize() {
			chartInstance.resize();
		}

		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
			chartInstance.dispose();
		};
	}, [createInstance, fromTokenSymbol, toTokenSymbol, mcap, minimumSlippage, maximumSlippage]);

	useEffect(() => {
		// create instance
		const chartInstance = createInstance();

		chartInstance.setOption({
			xAxis: {
				min: chartData[0][0]
			},
			series: { data: chartData }
		});
	}, [chartData, createInstance]);

	return <div id={id} style={{ height: '400px', margin: 'auto 0' }}></div>;
}
