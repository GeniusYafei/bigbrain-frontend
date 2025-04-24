import { useState } from "react";
import { fileToDataUrl } from "../utils/helpers";
import { useNotification } from "../utils/useNotification.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";

export default function GameFormModal({ open, onClose, onCreate }) {
  // State for game name, thumbnail image and filename
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [fileName, setFileName] = useState("");
  const { notify } = useNotification();

  // Handle user selecting a new thumbnail image
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setThumbnail(dataUrl);
        setFileName(file.name);
      } catch (err) {
        notify(err, 'error');
      }
    }
  };

  // Remove selected thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setFileName("");
  };

  // Submit new game creation
  const handleSubmit = () => {
    if (name.trim() === "") return;
    onCreate(name.trim(), thumbnail);
    setName("");
    setThumbnail(null);
    setFileName("");
  };

  // Cancel and reset form state
  const handleClose = () => {
    setName("");
    setThumbnail(null);
    setFileName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Game</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Thumbnail preview and image control section */}
          {thumbnail ? (
            <>
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  Preview: {fileName}
                </Typography>
                <Box
                  component="img"
                  src={thumbnail}
                  alt="Thumbnail Preview"
                  sx={{
                    mt: 1,
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: "1px solid #ccc",
                  }}
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Change Thumbnail
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleThumbnailChange}
                  />
                </Button>
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveThumbnail}
                >
                  Remove
                </Button>
              </Box>
            </>
          ) : (
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Thumbnail
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={handleThumbnailChange}
              />
            </Button>
          )}

          {/* Game name input field */}
          <TextField
            id="gameName"
            label="Game Name"
            name="gameName"
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            autoFocus
            fullWidth
          />
        </Box>
      </DialogContent>

      {/* Action buttons at bottom */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!name.trim()} data-cy="submit-create-game">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
