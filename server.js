const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

async function startAzurePipeline(project, pipelineId, pat, campaignId, catalogId, customerId, bucketName) {
  const url = `https://grupoltm.visualstudio.com/${project}/_apis/pipelines/${pipelineId}/runs?api-version=7.2-preview.1`;

  const payload = {
    resources: {
      repositories: {
        self: {
          refName: 'main'
        }
      }
    },
    variables: {
      campaignId: { value: campaignId },
      catalogId: { value: catalogId },
      customerId: { value: customerId },
      bucketName: { value: bucketName }
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
      }
    });

    if (response.status === 200) {
      console.log('Pipeline started successfully');
    } else {
      console.error(`Pipeline error: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Pipeline error: ${error.message}`);
  }
}

app.post('/api/deploy', async (req, res) => {
  const { project, pipelineId, pat, campaignId, catalogId, bucketName, customerId } = req.body;

  if (!campaignId || !catalogId || !customerId) {
    return res.status(400).send('Missing campaignId or catalogId or customerId');
  }

  try {
    await startAzurePipeline(project, pipelineId, pat, campaignId, catalogId, customerId, bucketName);
    res.status(200).send('Started');
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Escutando na porta do One Render
app.listen(port, () => {
  console.log(`Host: http://localhost:${port}`);
});
