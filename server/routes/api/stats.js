const express = require('express');
const config = require('config');
const Stat = require('../../models/Stat');
const moment = require('moment');

const router = express.Router();

// @route    GET /api/stats
// @desc     returns all stats
// @access   public
router.get('/', async (req, res) => {
  try {
    const stats = await Stat.find().sort({ created: -1 });
    res.send(stats.map(stat => transformStat(req, stat)));
  } catch (error) {
    setUnknownError(res, 'Error while getting all stats');
  }
});

// @route    POST /api/stats
// @desc     creates a new stat
// @access   public
router.post('/', async (req, res) => {
  try {
    const stat = await new Stat().save();
    res.send(transformStat(req, stat));
  } catch (error) {
    setUnknownError(res, 'Error while creating new stat');
  }
});

// @route    GET /api/stats/:statId
// @desc     returns a single stat
// @access   public
router.get('/:statId', async (req, res) => {
  try {
    const statId = req.params.statId;
    const stat = await getStat(statId);
    res.send(transformStat(req, stat));
  } catch (error) {
    setStatNotFound(res);
  }
});

// @route    PUT /api/stats/:statId
// @desc     updates a single stat (currently, properties 'name', 'description', 'chart', 'public' and 'showroom' can be updated)
// @access   public
router.put('/:statId', async (req, res) => {
  const statId = req.params.statId;
  const { name, description, chart, public, showroom } = req.body;

  // TODO replace validation with https://express-validator.github.io
  // TODO accept empty values (it must be possible to reset the name or description to an empty value)
  if (!name && !description && typeof chart !== 'boolean' && typeof public !== 'boolean' && typeof showroom !== 'boolean') {
    setInvalidPayload(res);
    return;
  }

  try {
    let stat = await getStat(statId);
    if (name) stat.name = name;
    if (description) stat.description = description;
    if (typeof chart === 'boolean') stat.chart = chart;
    if (typeof public === 'boolean') stat.public = public;
    if (typeof showroom === 'boolean') stat.showroom = showroom;

    stat = await stat.save();
    res.send(transformStat(req, stat));
  } catch (error) {
    setStatNotFound(res);
  }
});

// @route    DELETE /api/stats/:statId
// @desc     deletes a single stat
// @access   public
router.delete('/:statId', async (req, res) => {
  try {
    const statId = req.params.statId;
    await Stat.deleteOne({ statId });
    res.send({ msg: `stat with id '${statId}' deleted` });
  } catch (error) {
    setStatNotFound(res);
  }
});

// @route    GET /api/stats/:statId/values
// @desc     returns the values of a single stat
// @access   public
router.get('/:statId/values', async (req, res) => {
  try {
    const statId = req.params.statId;
    const values = await getStatValues(statId);
    res.send(transformStatValues(req, statId, values));
  } catch (error) {
    console.log(error);
    setStatNotFound(res);
  }
});

// @route    POST /api/stats/:statId/values
// @desc     adds a single value to a stat
// @access   public
router.post('/:statId/values', async (req, res) => {
  const statId = req.params.statId;
  let { value, timestamp } = req.body;

  // TODO validate timestamp with https://express-validator.github.io
  if (!timestamp) {
    timestamp = moment();
  }

  try {
    let stat = await getStat(statId);
    stat.values.data = [
      { value, timestamp },
      ...stat.values.data
    ];
    stat = await stat.save();
    res.send(transformStatValues(req, statId, stat.values));
  } catch (error) {
    setStatNotFound(res);
  }
});

// @route    DELETE /api/stats/:statId/values/:valueId
// @desc     deletes a single value from a stat
// @access   public
router.delete('/:statId/values/:valueId', async (req, res) => {
  try {
    const { statId, valueId } = req.params;
    let stat = await getStat(statId);
    let data = stat.values.data;
    const nrOfValuesBefore = data.length;
    data = data.filter(value => value.valueId !== valueId);

    if (data.length !== nrOfValuesBefore) {
      stat.values.data = data;
    } else {
      setValueNotFound(res);
      return;
    }

    stat = await stat.save();
    res.send(transformStatValues(req, statId, stat.values));
  } catch (error) {
    console.log(error);
    setStatNotFound(res);
  }
});

///////////////////////
// Utility functions //
///////////////////////

// Query functions
getStat = async (statId) => {
  const stat = await Stat.findOne({ statId });
  if (!stat) throw Error();
  return stat;
}

getStatValues = async (statId) => {
  const values = await Stat.findOne({ statId }, 'values');
  if (!values) throw Error();
  return values.values;
}

transformStat = (req, stat) => {
  let statObj = stat.toObject();
  delete statObj.values;
  statObj.url = `${getAPIBaseUrlForStats(req)}/${statObj.statId}`;
  statObj.uiUrl = `${getUIBaseUrlForStats(req)}/${statObj.statId}`;
  statObj.valuesUrl = `${getAPIBaseUrlForStats(req)}/${statObj.statId}/values`;
  return statObj;
}

transformStatValues = (req, statId, values) => {
  let valuesObj = values.toObject();
  valuesObj.data.forEach(value => {
    delete value._id;
    value.url = `${getAPIBaseUrlForStats(req)}/${statId}/values/${value.valueId}`;
  });

  function timestampComparator(value1, value2) {
    if (value1.timestamp < value2.timestamp) return 1;
    if (value1.timestamp > value2.timestamp) return -1;
    return 0;
  }
  valuesObj.data.sort(timestampComparator);

  const count = valuesObj.data.length;
  valuesObj.count = count;
  valuesObj.numeric = (count > 0 && valuesObj.data.findIndex(value => (value.value === '' || isNaN(value.value))) === -1);
  valuesObj.counting = (count > 0 && valuesObj.data.filter(value => value.value !== '').length === 0);
  valuesObj.statUrl = `${getAPIBaseUrlForStats(req)}/${statId}`;
  return valuesObj;
}

getAPIBaseUrlForStats = req => {
  return req.protocol + '://' + req.get('host') + '/api/stats';
}

getUIBaseUrlForStats = req => {
  if (process.env.NODE_ENV === 'production') {
    return req.protocol + '://' + req.get('host') + '/stat';
  } else {
    return config.get('client.url') + '/stat';
  }
}

// Error setting functions
// TODO https://expressjs.com/en/guide/error-handling.html
setInvalidPayload = (res) => {
  res.status(400).json({ msg: 'invalid payload' });
}

setStatNotFound = (res) => {
  res.status(404).json({ msg: 'stat not found' });
}

setValueNotFound = (res) => {
  res.status(404).json({ msg: 'value not found' });
}

setUnknownError = (res, msg) => {
  res.status(500).json({ msg });
}

module.exports = router;