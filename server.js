import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import axios from 'axios';
import fetch from 'node-fetch';

const app = express();

const corsOptions = {
  origin: ['https://nassoudl-frontend.onrender.com', 'http://localhost:5173'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const downloadFile = async (url, res) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  
  response.data.pipe(res);
};

const extractInstagramUrl = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const match = html.match(/"video_url":"([^"]+)"/);
    return match ? match[1].replace(/\\/g, '') : null;
  } catch (error) {
    return null;
  }
};

const extractTwitterUrl = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const match = html.match(/https:\/\/video\.twimg\.com\/[^"]+\.mp4/);
    return match ? match[0] : null;
  } catch (error) {
    return null;
  }
};

app.post('/api/download', async (req, res) => {
  try {
    const { url, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'URL YouTube invalide' });
      }

      const info = await ytdl.getInfo(url);
      const options = {
        quality: format === 'audio' ? 'highestaudio' : 'highest',
        filter: format === 'audio' ? 'audioonly' : 'videoandaudio'
      };

      const fileName = encodeURIComponent(`${info.videoDetails.title}.${format === 'audio' ? 'mp3' : 'mp4'}`);
      res.header('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
      res.header('Content-Type', format === 'audio' ? 'audio/mpeg' : 'video/mp4');

      const stream = ytdl(url, options);
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erreur lors du téléchargement' });
        }
      });
      stream.pipe(res);
    }
    
    // Instagram
    else if (url.includes('instagram.com')) {
      try {
        const mediaUrl = await extractInstagramUrl(url);
        if (mediaUrl) {
          const fileName = `instagram_media.${format === 'audio' ? 'mp3' : 'mp4'}`;
          res.header('Content-Disposition', `attachment; filename="${fileName}"`);
          await downloadFile(mediaUrl, res);
        } else {
          res.status(400).json({ error: 'Média Instagram non trouvé' });
        }
      } catch (error) {
        res.status(400).json({ error: 'Erreur lors du téléchargement Instagram' });
      }
    }
    
    // Twitter
    else if (url.includes('twitter.com') || url.includes('x.com')) {
      try {
        const mediaUrl = await extractTwitterUrl(url);
        if (mediaUrl) {
          const fileName = `twitter_media.${format === 'audio' ? 'mp3' : 'mp4'}`;
          res.header('Content-Disposition', `attachment; filename="${fileName}"`);
          await downloadFile(mediaUrl, res);
        } else {
          res.status(400).json({ error: 'Média Twitter non trouvé' });
        }
      } catch (error) {
        res.status(400).json({ error: 'Erreur lors du téléchargement Twitter' });
      }
    }
    
    // Facebook et TikTok
    else if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('tiktok.com')) {
      res.status(400).json({ 
        error: 'Facebook et TikTok nécessitent une authentification. Utilisez un service en ligne pour ces plateformes.' 
      });
    }
    
    else {
      res.status(400).json({ error: 'Plateforme non supportée' });
    }

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur lors du téléchargement' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
