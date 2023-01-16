import type { NextApiRequest, NextApiResponse } from 'next'
import { adapters } from '~/components/Aggregator/router';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { protocol, chain, from, to, amount } = req.query as {[key:string]:string};
    const body = JSON.parse(req.body);
    const agg = adapters.find((ag) => ag.name === protocol);
    if (agg === undefined) {
        return res.status(400).json({ message: "No DEX Aggregator with that name" });
    }
    const quote = await agg.getQuote(chain, from, to, amount, body);
    res.status(200).json(quote)
}