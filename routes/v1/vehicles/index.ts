import { Router } from 'express'

const router = Router({ mergeParams: true })

export const unobusVehicleWithOutlet: string[] = [
  '1486',
  '1525',
  '1584',
  '1585',
  '1613',
  '1614',
  '1615',
  '1616',
  '1617',
  '1618',
  '1619',
  '1620',
  '1658',
  '1659',
  '1660',
  '1661',
  '1662',
  '1663'
]

router.get('/:id', (req, res, next) =>
  res.json({
    socket: unobusVehicleWithOutlet.includes(req.params.id)
      ? [
          {
            type: 'electrical_outlet',
            voltage: 100
          }
        ]
      : []
  })
)

export default router
