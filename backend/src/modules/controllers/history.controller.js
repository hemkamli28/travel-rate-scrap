import { of } from "rxjs";
import * as path from "path";
import {
  deleteHistoryAllItems,
  deleteHistoryItem,
  getSearchedHistory,
} from "../../shared/utilities/dbFunctions.js";
import { NotFoundException } from "../../shared/utilities/errorClasses.js";

export const downloadExcel = async (req, res, next) => {
  try {
    const { filename } = req?.params;
    const filePath = path?.join(process.cwd(), "assets/downloads/" + filename);
    return of(res?.sendFile(filePath));
  } catch (error) {
    next(error);
  }
};

export const getAllHistory = async (req, res, next) => {
  try {
    const historySearch = await getSearchedHistory();
    return res
      ?.status(200)
      .json({
        success: true,
        message: "Searched History retrieved!",
        data: historySearch,
      });
  } catch (error) {
    next(new NotFoundException("No history data found!"));
  }
};

export const deleteHistoryById = async (req, res, next) => {
  try {
    const { id } = req?.params;
    const historyDelete = await deleteHistoryItem(id);
    if (!historyDelete) {
      throw new NotFoundException("History Not found");
    }
    return res
      ?.status(200)
      .json({ success: true, message: "Item deleted Successfully!" });
  } catch (error) {
    next(new NotFoundException("No history Item found!"));
  }
};

export const clearAllHistory = async (req, res, next) => {
  try {
    const deltedHistory = await deleteHistoryAllItems();
    if (!deltedHistory) {
      throw new NotFoundException("No History Data found");
    }
    return res
      ?.status(200)
      .json({ success: true, message: "History Deleted Successfully!" });
  } catch (error) {
    next(new NotFoundException("No history Data found!"));
  }
};
