/** @format */

import * as d3 from "d3";

export function heatMap() {
	const width = 1400;
	const height = 450;

	const svg = d3
		.select("#heat-map")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "svg");

	const tooltip = d3
		.select("#heat-map")
		.append("div")
		.style("opacity", 0)
		.attr("id", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "5px");

	const legend = d3
		.select("#heat-map")
		.append("svg")
		.attr("id", "legend")
		.attr("transform", "translate(60, 0)")
		.attr("width", 300)
		.attr("height", 50);

	//  an array of d3.interpolateInferno(0.0) to d3.interpolateInferno(1.0)
	const infernoRange = [
		d3.interpolateInferno(0.0),
		d3.interpolateInferno(0.1),
		d3.interpolateInferno(0.2),
		d3.interpolateInferno(0.3),
		d3.interpolateInferno(0.4),
		d3.interpolateInferno(0.5),
		d3.interpolateInferno(0.6),
		d3.interpolateInferno(0.7),
		d3.interpolateInferno(0.8),
		d3.interpolateInferno(0.9),
		d3.interpolateInferno(1.0),
	];

	let dataArray = [];

	// display and parse the JSON data from this https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json
	fetch(
		"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
	)
		.then((response) => response.json())
		.then((data) => {
			// console.log(data);
			dataArray = data.monthlyVariance;
			// console.log(dataArray);
			const baseTemp = data.baseTemperature;
			// console.log(baseTemp);
			const years = dataArray.map((item) => item.year);
			// console.log(years);
			const months = dataArray.map((item) => item.month);
			// console.log(months);
			const variances = dataArray.map((item) => item.variance);
			// console.log(variances);
			// array of baseTemp + variance and round off to two decimal places
			const temps = variances.map((item) => {
				return Math.round((baseTemp + item) * 100) / 100;
			});
			console.log(temps);

			const xScale = d3.scaleBand().domain(years).range([0, 1300]);

			const xAxis = d3.axisBottom(xScale).tickValues(
				xScale.domain().filter((d, i) => {
					return !(d % 10);
				})
			);

			svg.append("g")
				.attr("id", "x-axis")
				.attr("transform", "translate(60, 400)")
				.call(xAxis);

			const yScale = d3
				.scaleBand()
				.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
				.range([0, height - 50]);

			const yAxis = d3.axisLeft(yScale).tickFormat((d, i) => {
				const months = [
					"January",
					"February",
					"March",
					"April",
					"May",
					"June",
					"July",
					"August",
					"September",
					"October",
					"November",
					"December",
				];
				return months[i];
			});

			svg.append("g")
				.attr("id", "y-axis")
				.attr("transform", "translate(60, 0)")
				.call(yAxis);

			var myColor = d3
				.scaleSequential()
				.interpolator(d3.interpolateInferno)
				.domain([0, 13]);

			// Three function that change the tooltip when user hover / move / leave a cell
			var mouseover = function (d) {
				tooltip.style("opacity", 1);
				d3.select(this).style("stroke", "black").style("opacity", 1);
			};

			var mousemove = function (event, d) {
				const total = d.variance + data.baseTemperature;
				// round off total to two decimal places
				const totalRounded = Math.round(total * 100) / 100;
				// round off variance to two decimal places
				const varianceRounded = Math.round(d.variance * 100) / 100;
				// convert month to string month
				const month = new Date(d.year, d.month - 1).toLocaleString(
					"en-us",
					{ month: "long" }
				);
				tooltip
					.html(
						d.year +
							", " +
							month +
							"<br>" +
							totalRounded +
							"°C" +
							"<br>" +
							varianceRounded +
							"°C"
					)
					.style("left", event.pageX + 70 + "px")
					.style("top", event.pageY + "px");
				tooltip.attr("data-year", d.year);
			};

			var mouseleave = function (d) {
				tooltip.style("opacity", 0);
				d3.select(this).style("stroke", "none").style("opacity", 0.8);
			};

			svg.selectAll("rect")
				.data(dataArray)
				.enter()
				.append("rect")
				.attr("class", "cell")
				.attr("transform", "translate(60, 0)")
				.attr("data-month", (d) => {
					return d.month - 1;
				})
				.attr("data-year", (d) => {
					return d.year;
				})
				.attr("data-temp", (d) => {
					return data.baseTemperature + d.variance;
				})
				.attr("x", (d, i) => {
					return xScale(d.year);
				})
				.attr("y", (d, i) => {
					return yScale(d.month - 1);
				})
				.attr("width", (d) => xScale.bandwidth(d.year))
				.attr("height", (d) => yScale.bandwidth(d.month - 1))
				.style("fill", (d) => {
					return myColor(data.baseTemperature + d.variance);
				})
				.style("stroke-width", 1)
				.style("stroke", "none")
				.style("opacity", 0.8)
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseleave", mouseleave);

			// using legend const, append a rect for each color in infernoRange with x-axis of variances
			legend
				.selectAll("rect")
				.data(infernoRange)
				.enter()
				.append("rect")

				.attr("x", (d, i) => {
					return i * 30;
				})
				.attr("y", 0)
				.attr("width", 30)
				.attr("height", 30)
				.style("fill", (d) => {
					return d;
				})
				.style("stroke-width", 1)
				.style("stroke", "black");

			// TODO - append text to legend for each color in infernoRange with x-axis of variances
			legend.selectAll("text");
			const xScaleLegend = (d) => console.log(d);
			d3.scaleLinear().domain([temps.min, temps.max]).range([0, 300]);

			// const xAxisLegend = d3.axisBottom(xScale).tickValues(
			// 	xScale.domain().filter((d, i) => {
			// 		return !(d % 10);
			// 	})
			// );

			// svg.append("g")
			// 	.attr("id", "x-axis")
			// 	.attr("transform", "translate(60, 400)")
			// 	.call(xAxis);
		});
}
