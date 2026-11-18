'use client';

import { useEffect, useRef, useState } from 'react';
import * as DescriptionList from '../../data-display/DescriptionList.js';
import { Surface } from '../../layout/Surface.js';
import { devStats, type WorkStats } from './stats.js';

interface Sample {
  fps: number;
  worstFrameMs: number;
  geometry: string;
  reading: string;
  copies: string;
  renders: string;
}

const rateInTheLastSecond = (now: WorkStats, before: WorkStats) =>
  `${now.count - before.count}/s · last ${now.lastMs.toFixed(1)} ms`;

const copyOf = (stats: WorkStats) => ({ ...stats });

export function PerformancePanel({ planes }: { planes: number }) {
  const [sample, setSample] = useState<Sample | null>(null);
  const frames = useRef<number[]>([]);
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      frames.current.push(now - last);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    let before = {
      geometry: copyOf(devStats.geometry),
      reading: copyOf(devStats.reading),
      copies: copyOf(devStats.copies),
      renders: devStats.viewRenders,
    };
    const timer = window.setInterval(() => {
      const times = frames.current.splice(0);
      const total = times.reduce((sum, time) => sum + time, 0);
      setSample({
        fps: times.length ? Math.round((times.length * 1000) / Math.max(total, 1)) : 0,
        worstFrameMs: Math.round(Math.max(0, ...times)),
        geometry: rateInTheLastSecond(devStats.geometry, before.geometry),
        reading: rateInTheLastSecond(devStats.reading, before.reading),
        copies: rateInTheLastSecond(devStats.copies, before.copies),
        renders: `${devStats.viewRenders - before.renders}/s`,
      });
      before = {
        geometry: copyOf(devStats.geometry),
        reading: copyOf(devStats.reading),
        copies: copyOf(devStats.copies),
        renders: devStats.viewRenders,
      };
    }, 1000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);
  return (
    <Surface
      padding={3}
      radius="sm"
      className="env-dev-float env-dev-performance"
      role="group"
      aria-label="Performance"
    >
      <DescriptionList.Root layout="inline">
        <DescriptionList.Item label="Frame rate">
          {sample ? `${sample.fps} fps · worst ${sample.worstFrameMs} ms` : '…'}
        </DescriptionList.Item>
        <DescriptionList.Item label="Geometry">{sample?.geometry ?? '…'}</DescriptionList.Item>
        <DescriptionList.Item label="Readout">{sample?.reading ?? '…'}</DescriptionList.Item>
        <DescriptionList.Item label="Surfaces">{sample?.copies ?? '…'}</DescriptionList.Item>
        <DescriptionList.Item label="View renders">{sample?.renders ?? '…'}</DescriptionList.Item>
        <DescriptionList.Item label="Planes">{planes}</DescriptionList.Item>
      </DescriptionList.Root>
    </Surface>
  );
}
