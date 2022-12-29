import { useEffect, useState } from "react";
import { testAdapters } from "~/components/Aggregator/testAdapters.test";
import styled from 'styled-components';

const Table = styled.table`
th, td {
	padding-left: 3em;
  }
  th {
	padding: 3em;
  }
`;

export default function Aggregator(props) {
	const [tests, setTests] = useState([])
	const addTest = (test) => {tests.push(test); setTests([...tests])}
	useEffect(() => {
		testAdapters(addTest);
	}, [])
	return (
		<Table>
			<thead>
				<tr>
					{["Adapter", "Chain", "Connected", "From", "To", "Failure", "Value", "Median", "Drop"].map(name=><th key={name}>{name}</th>)}
				</tr>
			</thead>
			<tbody>
				{tests.map(({ adapter, chain, userAddress, from, to, success, value, median, drop }, idx) =>
					<tr key={idx}>
						<td>{adapter}</td>
						<td>{chain}</td>
						<td>{userAddress?"yes":"x"}</td>
						<td>{from}</td>
						<td>{to}</td>
						<td>{success}</td>
						<td>{value}</td>
						<td>{median}</td>
						<td>{drop}</td>
					</tr>
				)}
			</tbody>
		</Table>
	);
}
