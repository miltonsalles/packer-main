const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

async function startAzurePipeline(project, pipelineId, pat, envVars, campaignId, catalogId, bucketName) {
  const url = `https://dev.azure.com/grupoltm/${project}/_apis/pipelines/${pipelineId}/runs?api-version=7.2-preview.1`;

  const payload = {
    resources: {
      repositories: {
        self: {
          refName: 'main'
        }
      }
    },
    variables: {
      BUCKET_NAME: { value: bucketName },
      CAMPAIGN_ID: { value: campaignId },
      CATALOG_ID: { value: catalogId }
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
      console.log('Success');
    } else {
      console.error(`Error: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

app.post('/api/deploy', async (req, res) => {
  const { project, pipelineId, pat, envVars, campaignId, catalogId, bucketName } = req.body;

  if (!campaignId || !catalogId) {
    return res.status(400).send('Missing campaignId or catalogId');
  }

  try {
    await startAzurePipeline(project, pipelineId, pat, envVars, campaignId, catalogId, bucketName);
    res.status(200).send('Started');
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Escutando na porta do One Render
app.listen(port, () => {
  console.log(`Host: http://localhost:${port}`);
});
